'use strict';
import {getDb, COLLECTIONS} from "../service/db";
import {
    Db, ObjectID, InsertOneWriteOpResult, WriteOpResult, DeleteWriteOpResultObject,
    UpdateWriteOpResult
} from "mongodb";
import {Offer} from "../model/Model";

export function offerGet(args, res, next) {
    /**
     * Offer[]
     * ...
     *
     * username String The username of the user that is performing the request
     * date date  (optional)
     * startDate date  (optional)
     * endDate date  (optional)
     * returns List
     **/

    let findParams: any = {};

    let date = args.date.originalValue;
    let startDate = args.startdate.originalValue;
    let endDate = args.enddate.originalValue;

    if (date) findParams.date = new Date(date);
    if (startDate || endDate) findParams.date = {};

    if (startDate) {
        startDate = new Date(startDate);
        findParams.date.$gte = startDate;
    }
    if (endDate) {
        endDate = new Date(endDate);
        findParams.date.$lte = endDate;
    }

    getDb()
        .then(db => {
            db.collection(COLLECTIONS.OFFER_COLLECTION)
                .find(findParams).toArray()
                .then(function (elements) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(elements));
                })
        });
}

export function offerGetOne(args, res, next) {
    /**
     * Offer
     * ...
     *
     * username String The username of the user that is performing the request
     * offerid String The ID for the offer, given by the DB
     * returns Offer
     **/

    /* getDb()
     .then(db => {
     db.collection(COLLECTIONS.OFFER_COLLECTION)
     .findOne({
     _id : new ObjectID(args.offerid.originalValue)
     })
     .then(function(element){
     res.setHeader('Content-Type', 'application/json');
     if(element){
     res.end(JSON.stringify(element));
     }else{
     res.status(404).end();
     }
     })
     });*/
    getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);

    function performQuery(conn: Db): Promise<Offer> {
        return conn.collection(COLLECTIONS.OFFER_COLLECTION).findOne({
            _id: new ObjectID(args.offerid.originalValue)
        });
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(offer: Offer) {
        res.send(JSON.stringify(offer));
    }
}

export function offerPost(args, res, next) {
    /**
     * Create new Offer
     * ...
     *
     * username String The username of the user that is performing the request
     * offerData Offer ...
     * date date  (optional)
     * startdate date  (optional)
     * enddate date  (optional)
     * returns Offer
     **/

    let offer: Offer = args.offerData.value;
    offer.date = new Date(offer.date);
    console.log(args.offerData);


    getDb()
        .then(db => {
            db.collection(COLLECTIONS.OFFER_COLLECTION)
                .insertOne(offer)
                .then((result: InsertOneWriteOpResult) => {
                    offer._id = result.insertedId.toString();
                    res.send(offer);
                })
        });
}

export function offerPut(args, res, next) {
    let offer: Offer = args.offerData.value;
    offer._id = new ObjectID(offer._id as string);

    getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);
    function performQuery(conn: Db): Promise<UpdateWriteOpResult> {
        return conn.collection(COLLECTIONS.OFFER_COLLECTION).updateOne({
            _id: offer._id
        }, offer)
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(result: UpdateWriteOpResult) {
        res.send(JSON.stringify(offer));
    }
}

export function offerDelete(args, res, next) {
    getDb()
        .then(performQuery)
        .catch(abortResponse)
        .then(sendResult);
    function performQuery(conn: Db): Promise<DeleteWriteOpResultObject> {
        return conn.collection(COLLECTIONS.OFFER_COLLECTION).deleteOne({
            _id: new ObjectID(args.offerid.originalValue)
        });
    }

    function abortResponse(error: Error) {
        res.status(500).send(JSON.stringify(error));
    }

    function sendResult(result: DeleteWriteOpResultObject) {
        if(result.result.n == 0){
            res.status(404).send();
            next();
            return;
        }else{
            res.status(204).send();
            next();
            return;
        }
    }
}

