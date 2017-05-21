import {ObjectID} from "mongodb";
export class ModelError {
    'code': number;
    'message': string;
    'fields': string;
}

/**
 * A description for an offer, usually a dish, salad, etc. All properties are required.
 */
export class Offer {
    /**
     * ...
     */
    'description': string;
    /**
     * ...
     */
    '_id': string | ObjectID;
    /**
     * ...
     */
    'price': number;
    /**
     * Frühstück / Mittags
     */
    'time': string;
    /**
     * Main meal or side dish. Side dishes would be a salad or a soup, eggs in the morning, ...
     */
    'main_offer': boolean;
    /**
     * ...
     */
    'vegetarian': boolean;
    /**
     * Describes the heat at which the offer was cooked. Needed for health governance
     */
    'heat': number;

    'date': Date;
}

export class Order {
    /**
     * The ID given by the database
     */
    '_id': string | ObjectID;
    /**
     * ...
     */
    'employee_id': string;
    'offer': Offer;
    /**
     * Is takeaway
     */
    'takeaway_Flag': boolean;

    /**
     * ...
     */
    'date': Date;
    /**
     * The price paid for the product. Some employees might pay less than others due to their status (e.g. students)
     */
    'amount': number;
    /**
     * ...
     */
    'paid': boolean;
}

export class OfferOrdersPair {
    'offer': Offer;
    'orders': Array<Order>;
}

export class OrderBooking {
    'offer_id': string;
    'takeaway_flag': boolean;
}

export class User {
    /**
     * The three letter shortcut code for the employee
     */
    'employee_id': string;
    'open_payments_sum': number;
}
