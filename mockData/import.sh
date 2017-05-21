#!/usr/bin/env bash

mongoimport --host 127.0.0.1 --db steak --collection orders --type json orders.json
mongoimport --host 127.0.0.1 --db steak --collection offers --type json offers.json