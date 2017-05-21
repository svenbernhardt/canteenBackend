'use strict';
import {OrderBooking, Order, Offer} from "../model/Model";
import {getDb, COLLECTIONS} from "../service/db";
import {Db, InsertOneWriteOpResult, ObjectID, DeleteWriteOpResultObject, UpdateWriteOpResult} from "mongodb";
import * as e from "express";
import Response = e.Response;


export function orderPost(args, res, next) {
    let newBooking: OrderBooking = args['OrderBooking'].originalValue;

    let order = new Order();
    order.employee_id = args['x-auth-username'].originalValue;


    order.takeaway_Flag = newBooking.takeaway_flag;
    order.paid = false;
    let _conn: Db;

    return getDb()
        .then(handleConnection)
        .then(buildOrder)
        .then(storeOrder)
        .then(returnResult);


    // ---- functions used ----
    function handleConnection(conn) {
        _conn = conn;
        return conn.collection(COLLECTIONS.OFFER_COLLECTION).findOne({_id: new ObjectID(newBooking.offer_id)}) as Promise<Offer>;
    }

    function buildOrder(offer: Offer) {
        if (!offer) throw new Error('offer for id ' + newBooking.offer_id + 'not found in DB');
        return new Promise<Order>((resolve, reject) => {
            order.offer = offer;
            order.amount = offer.price;
            resolve(order)
        })
    }

    function storeOrder(order: Order) {
        return _conn.collection(COLLECTIONS.ORDERS_COLLECTION).insertOne(order)
    }

    function returnResult(result: InsertOneWriteOpResult) {
        order._id = result.insertedId.toString();
        res.send(order);
        next();
    }
}


/**
 * Order[]
 * Alle Bestellungen
 *
 * username String The username of the user that is performing the request
 * startdate date  (optional)
 * date date  (optional)
 * enddate date  (optional)
 * userid String The user id for which to fetch data (optional)
 * cursor String Pagination cursor. If there is not a limit defined, each cursor result gives back 30 results (optional)
 * limit Integer Result limiter. (optional)
 * open_payments Boolean A flag that can be set to true to only get employees with open payments (optional)
 * returns List
 **/
export function ordersGET(args, res: Response, next) {

    //getting parameters from request
    let userid: String = args.userid.originalValue;
    let date = args.date.originalValue;
    let startDate = args.startdate.originalValue;
    let endDate = args.enddate.originalValue;
    let openPayments = args.open_payments.originalValue;

    //building filter query
    let findParams: any = {};

    if (date || startDate || endDate) findParams['offer.date'] = {}; //adding filter on offer

    if (date) findParams['offer.date'].$eq = new Date(date);
    if (startDate) findParams['offer.date'].$gte = new Date(startDate);
    if (endDate) findParams['offer.date'].$lt = new Date(endDate);
    if (userid) findParams.employee_id = userid;
    if (openPayments) findParams.paid = !openPayments;


    console.log(findParams);
    let _conn: Db;
     return getDb()
    //Query the data
        .then(conn => {
            _conn = conn;
            return conn.collection(COLLECTIONS.ORDERS_COLLECTION).find(findParams).toArray() as Promise<Order[]>;
        })
        //Respond data
        .then((orders: Order[]) => {
            res.send(JSON.stringify(orders))
        })
}

export function orderGetOne(args, res, next) {
    return getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);
    function performQuery(conn: Db): Promise<Order> {
        return conn.collection(COLLECTIONS.ORDERS_COLLECTION).findOne({
            _id: new ObjectID(args.orderid.originalValue)
        });
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(order: Order) {
        res.send(JSON.stringify(order));
    }
}

export function orderPut(args, res, next) {

    let order: Order = args.orderData.value;
    order._id = new ObjectID(order._id as string);
    order.offer.date = new Date(order.offer.date);

    return getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);
    function performQuery(conn: Db): Promise<UpdateWriteOpResult> {
        return conn.collection(COLLECTIONS.ORDERS_COLLECTION).updateOne({
            _id: order._id
        }, order)
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(result: UpdateWriteOpResult) {
        res.send(JSON.stringify(order));
    }
}

export function orderDelete(args, res, next) {

    return getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);
    function performQuery(conn: Db): Promise<DeleteWriteOpResultObject> {
        return conn.collection(COLLECTIONS.ORDERS_COLLECTION).deleteOne({
            _id: new ObjectID(args.orderid.originalValue)
        });
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(deleteWriteResult: DeleteWriteOpResultObject) {
        res.status(204).send();
    }

}

