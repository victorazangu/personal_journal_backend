const { query } = require('express');
const Joi = require('joi');

const createJournal = {
    body: Joi.object()
        .keys({
            title: Joi.string().required(),
            content: Joi.string().required(),
            category_id: Joi.number().integer().required(),
        })
        .min(1),
};

const listAllCategories = {
    query: Joi.object()
        .keys({
            page: Joi.number().integer(),
            pageSize: Joi.number().integer(),
        })
        .min(1),
};

const listAllJournalEntriesByCategory = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    query: Joi.object()
        .keys({
            page: Joi.number().integer(),
            pageSize: Joi.number().integer(),
        })
};

const listAllUsersJournalEntry = {
    query: Joi.object()
        .keys({
            page: Joi.number().integer(),
            pageSize: Joi.number().integer(),
        })
};

const getJournalEntryById = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};

const updateJournalEntry = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
        title: Joi.string(),
        content: Joi.string(),
        category_id: Joi.string(),
    }), 
};

const deleteJournalEntry = {
    params: Joi.object().keys({
        id: Joi.number().integer().required(),
    }),
};








module.exports = {
    createJournal,
    listAllCategories,
    listAllJournalEntriesByCategory,
    listAllUsersJournalEntry,
    getJournalEntryById,
    updateJournalEntry,
    deleteJournalEntry
}