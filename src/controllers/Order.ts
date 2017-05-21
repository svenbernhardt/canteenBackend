import * as OrderService from "./OrderService";

module.exports.orderPost = function orderPUT(req, res, next) {
    return OrderService.orderPost(req.swagger.params, res, next);
};

module.exports.orderPut = function orderPUT(req, res, next) {
    return OrderService.orderPut(req.swagger.params, res, next);
};

module.exports.ordersGET = function ordersGET(req, res, next) {
    return OrderService.ordersGET(req.swagger.params, res, next);
};

module.exports.orderGetOne = function orderGetOne(req, res, next) {
    return OrderService.orderGetOne(req.swagger.params, res, next);
};

module.exports.orderPost = function orderPost(req, res, next) {
    return OrderService.orderPost(req.swagger.params, res, next);
};

module.exports.orderDelete = function orderPost(req, res, next) {
    return OrderService.orderDelete(req.swagger.params, res, next);
};
