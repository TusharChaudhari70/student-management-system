--liquibase formatted sql
--changeset tushar:005

CREATE TABLE liquibase_test (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);