import {getDb, COLLECTIONS} from "../src/service/db";
import {InsertWriteOpResult} from "mongodb";
import {UpdateWriteOpResult} from "mongodb";
import {Offer} from "../src/model/Model";

let promises = [];

getDb()
    .then(conn => {
        return conn.collection(COLLECTIONS.OFFER_COLLECTION)
            .find({})
            .toArray()
    })
    .then(handleOffers)
    .then(offers => storeOffers(offers));


function handleOffers(offers: Offer[]): Promise<Offer[]> {
    return new Promise((resolve, reject) => {
        console.log('fetched all');
        offers.forEach(offer => {
            fixDate(offer);
            fixBooleans(offer);
            fixIDs(offer)
        });
        console.log('fixed all');
        resolve(offers);
    })
}

function storeOffers(offers: Offer[]): Promise<InsertWriteOpResult> {
    return getDb().then(conn => {
        return conn.collection('fixed')
            .insertMany(offers)
    });
}

function fixDate(offer: Offer) {
    let dateString = JSON.stringify(offer.date);
    dateString = dateString.slice(1, 11);


    let days = Number.parseInt(dateString.slice(0, 2));
    let month = Number.parseInt(dateString.slice(3, 5));
    let year = Number.parseInt(dateString.slice(6, 10));

    offer.date = new Date(Date.UTC(year, month, days, 0, 0, 0));
}

function fixBooleans(offer): void {
    offer.vegetarian = offer.vegetarian.toLowerCase() == 'true';
    offer.main_offer = offer.main_offer.toLowerCase() == 'true';
}

function fixIDs(offer: Offer){
    delete offer._id;
}
