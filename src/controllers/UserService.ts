'use strict';
import {getDb, COLLECTIONS} from "../service/db";
import {Db} from "mongodb";
import {Order, User, Offer, OfferOrdersPair} from "../model/Model";
import * as e from "express";
import _ = require("lodash");
import Response = e.Response;


/**
 * Function to handle the User request
 * @param args
 * @param res
 * @param next
 * @returns {Promise<TResult>}
 */
export function userGet(args, res: Response, next) {
    let employeeId = args['useridpath'].originalValue;
    return getDb()
        .then(performQuery)
        .then(orders => sumUserOrders(employeeId, orders))
        .then(sendResult);

    function performQuery(conn: Db): Promise<Order[]> {
        return conn.collection(COLLECTIONS.ORDERS_COLLECTION).find({employee_id: employeeId}).toArray()
    }


    function sendResult(user: User) {
        res.send(JSON.stringify(user));
    }

}

/**
 * Get many users. We don't have a user table but we build one that summarizes the orders of people
 * @param args
 * @param res
 * @param next
 * @returns {Promise<TResult>}
 */
export function userGetMany(args, res: Response, next) {
    let openPayments: boolean = !!args['open_payments'].originalValue;

    let query: any = {};
    openPayments ? query.paid = !openPayments : null;   //if flag openPayments is set, only find those that have not yet been paid

    return getDb()
        .then(performQuery)
        .catch(err => abortResponse(err, res))
        .then(sumOrdersForEachUser)
        .then(sendResult);

    function performQuery(conn: Db): Promise<Order[]> {
        return conn.collection(COLLECTIONS.ORDERS_COLLECTION).find(query).toArray()
    }

    function sendResult(users: User[]) {
        res.send(JSON.stringify(users));
    }

}

/**
 * Function returns the orders and offers for a user for a specific date. both Date and User must be passed along in the API request
 * @param args
 * @param res
 * @param next
 */
export function offersOrdersMap(args, res: Response, next) {
    let employeeId = args['useridpath'].originalValue;
    let date = args['datepath'].originalValue;
    let offersQuery = {date: new Date(date)};

    let _offers: Offer[];
    let _orders: Order[];
    let _conn: Db;

    return getDb()
        .then(getOffers)
        .then(getOrders)
        .then(mergeResults)
        .then(reducePayloadSize)
        .then(sendResult)
        .catch(err => abortResponse(err, res));

    //fetches the offers from the DB
    function getOffers(conn: Db): Promise<Offer[]> {
        _conn = conn;
        return conn.collection(COLLECTIONS.OFFER_COLLECTION).find(offersQuery).toArray()
    }

    //fetches the orders that match the Offer IDs and the employeeId
    function getOrders(offers: Offer[]): Promise<Order[]> {
        _offers = offers;
        let offerIds = offers.map(offer => offer._id);
        let ordersQuery = {'offer._id': {$in: offerIds}, employee_id: employeeId};
        return _conn.collection(COLLECTIONS.ORDERS_COLLECTION).find(ordersQuery).toArray()
    }

    //creates pairs of Offers and Orders.
    function mergeResults(orders: Order[]): Promise<OfferOrdersPair[]> {
        let pairs: OfferOrdersPair[] = [];
        return new Promise((resolve, reject) => {
            _offers.forEach(of => {
                let pair: OfferOrdersPair = {
                    offer: of,
                    orders: orders.filter(od => isSameOffer(od, of))
                };
                pairs.push(pair)
            });
            resolve(pairs);
        })
    }

    //compare helper function. is offer ID and offer in order object the same?
    function isSameOffer(od, of) {
        if (!od.offer || !of) {
            debugger;
        }
        if (od.offer._id.toString() == of._id.toString()) {
            return true;
        }
    }

    //just lighten the sending back payload a bit. not needed to send an offer in an order in an offer
    function reducePayloadSize(pairs: OfferOrdersPair[]) {
        return new Promise(resolve => {
            pairs.forEach(pair => {
                pair.orders.forEach(order => {
                    delete order.offer;
                })
            });
            resolve(pairs);
        });
    }

    function sendResult(pairs: OfferOrdersPair[]) {
        res.send(JSON.stringify(pairs));
        next();
    }
}

/**
 * helper function that sums the bill amounts for orders of users
 * @param orders
 * @returns {Promise<T>}
 */
function sumOrdersForEachUser(orders: Order[]): Promise<User[]> {
    return new Promise((resolve, reject) => {
        let users: any = {};
        orders.forEach(order => {
            let usr = users[order.employee_id];
            //if the user does not exist yet we create a new one
            if (!usr) {
                usr = new User();
                usr.employeeId = order.employee_id;
                usr.open_payments_sum = 0;
                users[order.employee_id] = usr;
            }
            !order.paid && order.amount ? usr.open_payments_sum += order.amount : null;
        });
        resolve(_.values(users))
    });
}


function sumUserOrders(employeeId, ordersForUser: Order[]): Promise<User> {
    return new Promise((resolve, reject) => {
        let user = new User();
        user.employee_id = employeeId;
        user.open_payments_sum = 0;
        ordersForUser.forEach(order => !order.paid && !!order.amount ? user.open_payments_sum += order.amount : null);
        resolve(user)
    })
}

function abortResponse(error: Error, res: Response) {
    res.status(500).send(JSON.stringify(error));
}