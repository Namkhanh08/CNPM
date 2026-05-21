import auth from './auth';
import products from './products';
import carts from './carts';
import orders from './orders';
import inventory from './inventory';
import users from './users';
import dashboard from './dashboard';
import vouchers from './vouchers';
import loyalty from './loyalty';
import subscriptions from './subscriptions';

const API = {
    ...auth,
    ...products,
    ...carts,
    ...orders,
    ...inventory,
    ...users,
    ...dashboard,
    ...vouchers,
    ...loyalty,
    ...subscriptions
};

export default API;
