export const DEV_API_URL = 'http://localhost:3000/api';
export const DEV_WEB_URL = 'http://localhost:3000';
export const DEV_FLASK_URL = 'http://localhost:5000';


export const PROD_API_URL = 'https://running-router-j5f2o.ondigitalocean.app/api';
export const PROD_WEB_URL = 'https://running-router-j5f2o.ondigitalocean.app/';
export const PROD_FLASK_URL = 'http://134.209.46.156:8080';

const DEV = false;
export const API_URL = DEV ? DEV_API_URL : PROD_API_URL;
export const WEB_URL = DEV ? DEV_WEB_URL : PROD_WEB_URL;
export const FLASK_URL = DEV ? DEV_FLASK_URL : PROD_FLASK_URL;
