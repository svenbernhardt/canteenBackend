#!/usr/bin/env bash

mongoexport --host 127.0.0.1 --db steak --collection orders --type json --out orders.json
mongoexport --host 127.0.0.1 --db steak --collection offers --type json --out offers.json