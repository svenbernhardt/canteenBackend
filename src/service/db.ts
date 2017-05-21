import {MongoClient, Db} from "mongodb";

let dbConn : Db;
let MONGO_URL: string = 'mongodb://mongodb:27017/steak';
//MONGO_URL = 'mongodb://10.100.175.7:27017/steak';

//process.env.NODE_ENV === 'development' ? true : false


export let COLLECTIONS = {
    OFFER_COLLECTION: 'offers',
    ORDERS_COLLECTION: 'orders'
};

export function getDb(): Promise<Db>{
    return new Promise<Db>((resolve, reject)=>{
        if(dbConn) resolve(dbConn);
        else{
            MongoClient.connect(MONGO_URL)
                .then(db =>{
                    dbConn = db;
                    console.log('conntected to db ' + MONGO_URL);
                    resolve(db);
                })
                .catch(error =>{
                    console.log(error);
                    reject(error)
                });
        }
    });
}