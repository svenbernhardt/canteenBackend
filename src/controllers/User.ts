import * as UserService from "./UserService";

module.exports.userGetMany = function orderPUT(req, res, next) {
    return UserService.userGetMany(req.swagger.params, res, next);
};

module.exports.userGet = function orderPUT(req, res, next) {
    return UserService.userGet(req.swagger.params, res, next);
};

module.exports.offersOrdersGET = function ordersGET(req, res, next) {
    return UserService.offersOrdersMap(req.swagger.params, res, next);
};
