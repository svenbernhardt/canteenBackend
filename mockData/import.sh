#!/usr/bin/env bash

mongoimport --host 129.144.149.167 --db steak --collection orders --type json orders.json
mongoimport --host 129.144.149.167 --db steak --collection offers --type json offers.json