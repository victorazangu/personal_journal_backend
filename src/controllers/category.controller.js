const { Category } = require("../models")



const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            return res.status(400).json({ error: "Category with this name already exists", status: "fail", success: false });
        }
        const newCategory = await Category.create({ name });
        return res.status(201).json({ data: newCategory, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const listAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const pageSize = parseInt(req.query.pageSize) || 10; 

        const offset = (page - 1) * pageSize;

        const categories = await Category.findAndCountAll({
            offset: offset,
            limit: pageSize,
        });

        const totalPages = Math.ceil(categories.count / pageSize);
        return res.status(200).json({
            data: categories.rows,
            totalPages,
            page,
            pageSize,
            status: "success",
            success: true,
        });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found", status: "fail", success: false });
        }
        return res.status(200).json({ data: category, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};


const updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name } = req.body;
        let category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found", status: "fail", success: false });
        }
        category.name = name;
        await category.save();
        return res.status(200).json({ data: category, status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found", status: "fail", success: false });
        }
        await category.destroy();
        return res.status(200).json({ message: "Category deleted successfully", status: "success", success: true });
    } catch (error) {
        return res.status(500).json({ error: "Server side error", status: "fail", success: false });
    }
};

module.exports = {
    createCategory,
    listAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};