import Product from "../models/Product.js";
import ContactLens from "../models/ContactLens.js";

const HIERARCHICAL_KEYS = new Set([
  "Gender",
  "Collection",
  "Shape",
  "Style",
  "Brands",
  "Usage",
  "Explore by Disposability",
  "Explore by Power",
  "Explore by Color",
  "Solution",
]);

function mapKeyToProductInfoPath(key) {
  const lowerKey = key.toLowerCase();
  if (lowerKey === "brands" || lowerKey === "brand") return "product_info.brand";
  if (lowerKey === "gender") return "product_info.gender";
  if (lowerKey === "shape") return "product_info.frameShape";
  if (lowerKey === "style") return "product_info.rimDetails";
  if (lowerKey === "usage") return "product_info.usage";
  if (lowerKey === "explore by disposability") return "product_info.disposability";
  if (lowerKey === "explore by power") return "product_info.power";
  if (lowerKey === "explore by color") return "product_info.color";
  if (lowerKey === "solution") return "product_info.solution";
  return `product_info.${lowerKey}`;
}

export const listProducts = async (req, res) => {
  try {
    const query = req.query || {};
    const andConditions = [];

    // Pagination parameters (default 18 per page)
    const page = Math.max(parseInt(query.page) || 1, 1);
    const limit = Math.max(parseInt(query.limit) || 18, 1);
    const skip = (page - 1) * limit;

    if (query.category) andConditions.push({ category: { $regex: `^${query.category}$`, $options: "i" } });
    if (query.subCategory) andConditions.push({ subCategory: { $regex: `^${query.subCategory}$`, $options: "i" } });
    if (query.subSubCategory) andConditions.push({ subSubCategory: { $regex: `^${query.subSubCategory}$`, $options: "i" } });

    for (const [key, rawVal] of Object.entries(query)) {
      if (!HIERARCHICAL_KEYS.has(key)) continue;
      const infoPath = mapKeyToProductInfoPath(key);
      const val = String(rawVal);
      andConditions.push({
        $or: [
          { subCategory: key, subSubCategory: rawVal },
          { [infoPath]: { $regex: `^${val}$`, $options: "i" } },
        ],
      });
    }

    const RESERVED = new Set(["category","subCategory","subSubCategory","limit","page","search","sort","order","priceRange","gender","color"]);
    for (const [key, rawVal] of Object.entries(query)) {
      if (RESERVED.has(key)) continue;
      if (HIERARCHICAL_KEYS.has(key)) continue;
      const infoPath = mapKeyToProductInfoPath(key);
      const val = String(rawVal);
      andConditions.push({ [infoPath]: { $regex: `^${val}$`, $options: "i" } });
    }

    if (query.search) {
      andConditions.push({ title: { $regex: query.search, $options: "i" } });
    }

    // Additional filters
    if (query.priceRange) {
      // Accept forms like "300-1000" or "10000+"
      const pr = String(query.priceRange).trim();
      let priceCond = {};
      if (/^\d+\-\d+$/.test(pr)) {
        const [min, max] = pr.split('-').map(n => parseInt(n, 10));
        if (!isNaN(min)) priceCond.$gte = min;
        if (!isNaN(max)) priceCond.$lte = max;
      } else if (/^\d+\+$/.test(pr)) {
        const min = parseInt(pr.replace('+',''), 10);
        if (!isNaN(min)) priceCond.$gte = min;
      }
      if (Object.keys(priceCond).length) andConditions.push({ price: priceCond });
    }

    if (query.gender) {
      andConditions.push({ 'product_info.gender': { $regex: `^${String(query.gender)}$`, $options: 'i' } });
    }

    if (query.color) {
      andConditions.push({ 'product_info.color': { $regex: `^${String(query.color)}$`, $options: 'i' } });
    }

    const mongoFilter = andConditions.length > 0 ? { $and: andConditions } : {};

    // If a specific category is requested, route to the appropriate collection for reliable results
    const requestedCategory = typeof query.category === 'string' ? query.category : '';
    if (/^contact\s+lenses$/i.test(requestedCategory)) {
      const [totalCount, data] = await Promise.all([
        ContactLens.countDocuments(mongoFilter),
        ContactLens.find(mongoFilter).sort({ _id: 1 }).skip(skip).limit(limit)

      ]);
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 0,
        totalProducts: totalCount,
        productsPerPage: limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      };
      return res.json({ products: data.map(d => ({ ...d._doc, _type: 'contactLens' })), pagination });
    }
    if (requestedCategory && !/^contact\s+lenses$/i.test(requestedCategory)) {
      const [totalCount, data] = await Promise.all([
        Product.countDocuments(mongoFilter),
        Product.find(mongoFilter).sort({ _id: 1 }).skip(skip).limit(limit)

      ]);
      const pagination = {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 0,
        totalProducts: totalCount,
        productsPerPage: limit,
        hasNextPage: page * limit < totalCount,
        hasPrevPage: page > 1,
      };
      return res.json({ products: data.map(d => ({ ...d._doc, _type: 'product' })), pagination });
    }

    // No specific category: use aggregation with $unionWith for cross-collection pagination
    const matchStage = { $match: mongoFilter };
    const addTypeProduct = { $addFields: { _type: "product" } };
    const addTypeContact = { $addFields: { _type: "contactLens" } };

    const pipeline = [
      matchStage,
      addTypeProduct,
      { $unionWith: { coll: "contactlenses", pipeline: [matchStage, addTypeContact] } },
      { $sort: { _id: 1 } },
      { $facet: { data: [ { $skip: skip }, { $limit: limit } ], totalCount: [ { $count: "count" } ] } }
    ];

    const aggResult = await Product.aggregate(pipeline);
    const data = aggResult?.[0]?.data || [];
    const totalCount = aggResult?.[0]?.totalCount?.[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit) || 0;

    const pagination = {
      currentPage: page,
      totalPages,
      totalProducts: totalCount,
      productsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return res.json({ products: data, pagination });
  } catch (error) {
    return res.status(500).json({
      message: "Error listing products",
      error: error?.message || String(error),
      products: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalProducts: 0,
        productsPerPage: 18,
        hasNextPage: false,
        hasPrevPage: false,
      }
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      product = await ContactLens.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.json({ ...product._doc, _type: "contactLens" });
    }
    res.json({ ...product._doc, _type: "product" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const getFacets = async (req, res) => {
  try {
    const query = req.query || {};
    const andConditions = [];

    if (query.category) andConditions.push({ category: { $regex: `^${query.category}$`, $options: "i" } });
    if (query.subCategory) andConditions.push({ subCategory: { $regex: `^${query.subCategory}$`, $options: "i" } });
    if (query.subSubCategory) andConditions.push({ subSubCategory: { $regex: `^${query.subSubCategory}$`, $options: "i" } });

    for (const [key, rawVal] of Object.entries(query)) {
      if (!HIERARCHICAL_KEYS.has(key)) continue;
      const infoPath = mapKeyToProductInfoPath(key);
      const val = String(rawVal);
      andConditions.push({ $or: [ { subCategory: key, subSubCategory: rawVal }, { [infoPath]: { $regex: `^${val}$`, $options: "i" } } ] });
    }

    const RESERVED = new Set(["category","subCategory","subSubCategory","limit","page","search","sort","order","priceRange","gender","color"]);
    for (const [key, rawVal] of Object.entries(query)) {
      if (RESERVED.has(key)) continue;
      if (HIERARCHICAL_KEYS.has(key)) continue;
      const infoPath = mapKeyToProductInfoPath(key);
      const val = String(rawVal);
      andConditions.push({ [infoPath]: { $regex: `^${val}$`, $options: "i" } });
    }

    if (query.search) andConditions.push({ title: { $regex: query.search, $options: "i" } });

    // Apply current selected filters (priceRange, gender, color) to base filter
    if (query.priceRange) {
      const pr = String(query.priceRange).trim();
      const priceCond = {};
      if (/^\d+\-\d+$/.test(pr)) {
        const [min, max] = pr.split('-').map(n => parseInt(n, 10));
        if (!isNaN(min)) priceCond.$gte = min;
        if (!isNaN(max)) priceCond.$lte = max;
      } else if (/^\d+\+$/.test(pr)) {
        const min = parseInt(pr.replace('+',''), 10);
        if (!isNaN(min)) priceCond.$gte = min;
      }
      if (Object.keys(priceCond).length) andConditions.push({ price: priceCond });
    }
    if (query.gender) andConditions.push({ 'product_info.gender': { $regex: `^${String(query.gender)}$`, $options: 'i' } });
    if (query.color) andConditions.push({ 'product_info.color': { $regex: `^${String(query.color)}$`, $options: 'i' } });

    const baseMatch = andConditions.length ? { $and: andConditions } : {};

    const priceBuckets = [
      { label: '300-1000', min: 300, max: 1000 },
      { label: '1001-2000', min: 1001, max: 2000 },
      { label: '2001-3000', min: 2001, max: 3000 },
      { label: '3001-4000', min: 3001, max: 4000 },
      { label: '4001-5000', min: 4001, max: 5000 }, 
      { label: '5000+', min: 5000 }
    ];

    // Build a facets aggregation pipeline
    const priceFacetStages = priceBuckets.map(b => ({
      $group: {
        _id: b.label,
        count: { $sum: {
          $cond: [
            { $and: [
              { $gte: ["$price", b.min] },
              ...(b.max ? [{ $lte: ["$price", b.max] }] : [])
            ] },
            1,
            0
          ]
        } }
      }
    }));

    const pipelineBase = [ { $match: baseMatch } ];

    // genders and colors from product_info
    const genderFacet = [ { $match: baseMatch }, { $group: { _id: { $toUpper: "$product_info.gender" }, count: { $sum: 1 } } } ];
    const colorFacet = [ { $match: baseMatch }, { $group: { _id: { $toUpper: "$product_info.color" }, count: { $sum: 1 } } } ];

    // Use union when no specific category; otherwise query appropriate collection
    const requestedCategory = typeof query.category === 'string' ? query.category : '';
    let dataAgg;
    if (/^contact\s+lenses$/i.test(requestedCategory)) {
      dataAgg = await ContactLens.aggregate([
        ...pipelineBase,
        { $facet: {
          genders: genderFacet.slice(1),
          colors: colorFacet.slice(1),
          prices: [ { $group: { _id: null, values: { $push: "$price" } } } ]
        } }
      ]);
    } else if (requestedCategory) {
      dataAgg = await Product.aggregate([
        ...pipelineBase,
        { $facet: {
          genders: genderFacet.slice(1),
          colors: colorFacet.slice(1),
          prices: [ { $group: { _id: null, values: { $push: "$price" } } } ]
        } }
      ]);
    } else {
      dataAgg = await Product.aggregate([
        { $match: baseMatch },
        { $unionWith: { coll: "contactlenses", pipeline: [ { $match: baseMatch } ] } },
        { $facet: {
          genders: [ { $group: { _id: { $toUpper: "$product_info.gender" }, count: { $sum: 1 } } } ],
          colors: [ { $group: { _id: { $toUpper: "$product_info.color" }, count: { $sum: 1 } } } ],
          prices: [ { $group: { _id: null, values: { $push: "$price" } } } ]
        } }
      ]);
    }

    const gendersRaw = dataAgg?.[0]?.genders || [];
    const colorsRaw = dataAgg?.[0]?.colors || [];
    const pricesRaw = (dataAgg?.[0]?.prices?.[0]?.values || []).filter(v => typeof v === 'number');

    // Count price buckets from pricesRaw
    const priceCounts = Object.fromEntries(priceBuckets.map(b => [b.label, 0]));
    for (const p of pricesRaw) {
      for (const b of priceBuckets) {
        if (p >= b.min && (b.max ? p <= b.max : true)) {
          priceCounts[b.label] += 1;
          break;
        }
      }
    }

    const genders = Object.fromEntries(gendersRaw.filter(g => g._id).map(g => [g._id, g.count]));
    const colors = Object.fromEntries(colorsRaw.filter(c => c._id).map(c => [c._id, c.count]));

    return res.json({ priceBuckets: priceCounts, genders, colors });
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching facets', error: err?.message || String(err) });
  }
};

export const adminListProducts = async (req, res) => {
  try {
    const { type = 'product' } = req.query;
    const search = String(req.query.search || '').trim();
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit) || 20, 1);
    const skip = (page - 1) * limit;

    const Model = /^contactlens/i.test(type) ? ContactLens : Product;
    const filter = {};
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [items, total] = await Promise.all([
      Model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Model.countDocuments(filter),
    ]);

    return res.json({
      items,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 0,
        totalItems: total,
        perPage: limit,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error listing products', error: err?.message || String(err) });
  }
};

export const adminCreateProduct = async (req, res) => {
  try {
    const { type = 'product', ...body } = req.body || {};
    const Model = /^contactlens/i.test(type) ? ContactLens : Product;

    // Basic unique check by title (case-insensitive) for Product only
    if (Model === Product && body?.title) {
      const existing = await Product.findOne({ title: body.title }).collation({ locale: 'en', strength: 2 });
      if (existing) return res.status(409).json({ message: 'Product title must be unique' });
    }

    // Normalize images similar to createProduct
    let imagesArray = [];
    if (Array.isArray(body.images)) imagesArray = body.images.filter(Boolean);
    if (!imagesArray.length && body.Images) {
      const { image1, image2 } = body.Images || {};
      imagesArray = [image1, image2].filter(Boolean);
    }
    if (!imagesArray.length && body.image1) {
      imagesArray = [body.image1, body.image2].filter(Boolean);
    }

    const payload = {
      title: body.title,
      price: body.price,
      description: body.description,
      category: body.category,
      subCategory: body.subCategory,
      subSubCategory: body.subSubCategory,
      product_info: body.product_info || {},
      images: imagesArray,
      ratings: body.ratings,
      discount: body.discount,
    };

    const created = await Model.create(payload);
    return res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ message: 'Duplicate key error', error: err?.message });
    return res.status(400).json({ message: 'Error creating product', error: err?.message || String(err) });
  }
};

export const adminUpdateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'product', ...body } = req.body || {};
    const Model = /^contactlens/i.test(type) ? ContactLens : Product;

    // Do not allow changing _id
    if (body._id) delete body._id;

    // Normalize optional images
    if (Array.isArray(body.images)) {
      body.images = body.images.filter(Boolean);
    }

    const updated = await Model.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ message: 'Error updating product', error: err?.message || String(err) });
  }
};

export const adminDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'product' } = req.query;
    const Model = /^contactlens/i.test(type) ? ContactLens : Product;

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ message: 'Error deleting product', error: err?.message || String(err) });
  }
};

export const createProduct = async (req, res) => {
  try {
    const body = { ...req.body };

    // Case-insensitive existence check to prevent duplicates by title
    const existing = await Product.findOne({ title: body.title }).collation({ locale: "en", strength: 2 });
    if (existing) {
      return res.status(409).json({ message: "Product title must be unique" });
    }

    // Normalize images
    let imagesArray = [];
    if (Array.isArray(body.images)) imagesArray = body.images.filter(Boolean);
    if (!imagesArray.length && body.Images) {
      const { image1, image2 } = body.Images || {};
      imagesArray = [image1, image2].filter(Boolean);
    }
    if (!imagesArray.length && body.image1) {
      imagesArray = [body.image1, body.image2].filter(Boolean);
    }

    const payload = {
      title: body.title,
      price: body.price,
      description: body.description,
      category: body.category,
      subCategory: body.subCategory,
      subSubCategory: body.subSubCategory,
      product_info: body.product_info || {},
      images: imagesArray,
      ratings: body.ratings,
      discount: body.discount,
    };

    const created = await Product.create(payload);
    return res.status(201).json(created);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "Product title must be unique" });
    }
    return res.status(400).json({ message: "Error creating product", error });
  }
};
