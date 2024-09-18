# qaseio@2.3.1

## What's new

Added a new `author_id` and `entity_id` fields to the `Author` model.

# qaseio@2.3.0

## What's new

Added a new `param_groups` field to the `ResultCreate` model. 
This field allows you to group parameters in the test results.

# qaseio@2.2.0

## What's new

Added search for environments and creation of test runs with the addition of an environment slug.

# qaseio@2.1.5

## What's new

Enable using 'http://api.qase.lo' as API host for Qase development.

# qaseio@2.1.4

## What's new

Fix an issue with base url for enterprise customers.   

# qaseio@2.1.3

## What's new

Configure custom Qase API URLs, such as for Enterprise on-premises installations
or for using proxies.

# qaseio@2.1.2

## What's new

Update `axios` dependency to `^0.28.0` for fixes vulnerabilities [CVE-2023-45857](https://github.com/advisories/GHSA-wf5p-g6vw-rhxx)

# qaseio@2.1.1

## What's new

Add environment API support. Now you can create, update, delete and list environments for your projects.

# qaseio@2.1.0

## What's new

The new release of Qase API client brings a number of new features:

* Full support of the latest state of the [Qase API](https://developers.qase.io/reference);
* Full support of the experimental v2 API for working with test results.
* Uploading test attachments from strings and buffers.
* New API endpoints: `v1/system-fields/` and `v1/configurations/`.

# qaseio@2.1.0-beta.1

## What's new

* Added support for uploading attachments from strings and buffers. 

# qaseio@2.1.0-beta.0

## Overview

This is a beta channel release, supporting the v2 series of the Qase JavaScript reporters.

## What's new

* Supporting the latest version of the [Qase API](https://developers.qase.io/reference).
* Significant updates to the `v2/results` endpoint.
* New endpoints: `v1/system-fields/` and `v1/configurations/`.
