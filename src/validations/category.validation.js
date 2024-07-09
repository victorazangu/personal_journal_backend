const { query } = require('express');
const Joi = require('joi');

const createCategory = {
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
        })
     
};

const listAllCategories = {
    query: Joi.object()
        .keys({
            page: Joi.number().integer(),
            pageSize: Joi.number().integer(),
        })
   
};


const getCategoryById = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const updateCategory = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        name: Joi.string(),
    }),
};

const deleteCategory = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};








module.exports = {
    createCategory,
    listAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
}