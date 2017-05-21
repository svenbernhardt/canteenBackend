'use strict';
import * as OfferService from './OfferService';



module.exports.offerGet = function offerGet (req, res, next) {
    OfferService.offerGet(req.swagger.params, res, next);
};

module.exports.offerGetOne = function offerGetOne (req, res, next) {
    OfferService.offerGetOne(req.swagger.params, res, next);
};

module.exports.offerPut = function offerPUT (req, res, next) {
    OfferService.offerPut(req.swagger.params, res, next);
};
module.exports.offerPost = function offerPUT (req, res, next) {
    OfferService.offerPost(req.swagger.params, res, next);
};

module.exports.offerDelete = function offerPUT (req, res, next) {
    OfferService.offerDelete(req.swagger.params, res, next);
};