-- Run as a PostgreSQL administrator, once, when not using Docker.
CREATE USER erp WITH PASSWORD 'erp_local';
CREATE DATABASE company_erp OWNER erp;
