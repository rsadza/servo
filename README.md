# Servo

An image resizing service to sit **behind** a dynamic cache (like CloudFront).

## Install

Install GraphicsMagick

```bash

# Ubuntu

apt-get install imagemagick graphicsmagick

# AWS Linux AMI

yum install ImageMagick GraphicsMagick

```


Install Servo with npm.

```bash
npm install -g servo
```

Set up your configuration (see below) and simply run

```bash
SERVO_CONFIG=/my/config.js servo
```

## Config

Servo uses a JS/JSON file for configuration that needs to be passed in through a
`SERVO_CONFIG` environment variable.

**sample servo.json**
```javascript
{
  // The port servo will listen for requests on.
  "port": 80,

  "headers": {
    "cacheControl": "max-age=315360000",
    "Access-Control-Allow-Origin": "*"
  },

  // Hosts that point to the cloudfront endpoint. Requests on servo that are not
  // from cloudfront will be redirected randomly to one of these hosts.
  "hosts": [
    "cdn0.example.com",
    "cdn1.example.com",
    "cdn2.example.com",
    "cdn3.example.com"
  ],

  // The S3 bucket to be used.
  "bucket": "some-s3-bucket",
  "bucketKeyPrefix": "public/img/",
  "pathPrefix": "/assets/", // Default: '/',

  // GraphicsMagick routines to put an image through when specified in the URL.
  "routines": {
    "profile": "scale:200,200,^;gravity:Center;extent:200,200;strip",
    "100x100": "resize:100,100;strip"
  }
}
```

## Requests

Servo responds to a few requests.

---

**request**
```
GET /path/to/resource[-routine][.extension]
  [?servoKey=servoKey[&ttl=seconds][&filename=contentDispositionFilename]]
```

No authentication is required for this request. If specific image at the
requested size and extension has yet to be generated, it will be generated on
the fly, otherwise the cloudfront cache should catch it. If authenticated, will
redirect to a signed URL for the requested resource.

**response**
```
(requested resource or empty body and error status code)
```

---

**request**
```
PUT /[explicit route]

servoKey=servoKey
(file=@imgA.jpg) OR (key=s3Key [bucket=default-bucket])
routine=strip;scale:100,100 (optional)
```

A Servo Key is required in the header of the request to PUT resources into S3.
When an explicit route is not specified, files are saved as their hashed value.
The resource mime type is extracted from the file's extension and stored as a
header in S3. An optional `routine` option may be added to put the image through
a series of GraphicsMagick operations before uploading.

**response**
```json
{
  "bucket": "orgsync-test"
  "key": "hashorexplicitroute...",
  "size": 1234,
  "type": "image/jpeg",
  "width": 100,
  "height": 200,
  "name": "imgA.jpg"
}
```

---

**request**
```
DELETE /path/to/resource

servoKey=servoKey
```

A Servo Key is required in the header of the request to DELETE resources in S3. The request simply returns a 200 status and empty JSON object on success.

**response**
```
204 No Content
```
