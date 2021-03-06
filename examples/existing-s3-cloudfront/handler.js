module.exports = {
  // invoked by CloudFront (origin response)
  async handler(event, context) {
    console.log(JSON.stringify({ context, event }, null, 2))
    const response = event.Records[0].cf.response
    const headers = response.headers
    // const requestHeaders = event.Records[0].cf.request.headers
    // const countryCode = requestHeaders['cloudfront-viewer-country'][0].value
    //
    headers['x-serverless-example'] = [
      {
        key: 'X-Serverless-Example',
        value: 'Existing s3 bucket/cloudfront'
      }
    ]

    headers['referrer-policy'] = [
      {
        key: 'Referrer-Policy',
        value: 'unsafe-url'
      }
    ]
    //
    // headers['x-country-code'] = [
    //   {
    //     key: 'X-Country-Code',
    //     value: countryCode
    //   }
    // ]
    //
    // // Fun fact! You can't set cookies from the origin response
    // // headers['set-cookie'] = [
    // //    {
    // //       key: 'Set-Cookie',
    // //       value: 'x-serverless-example=val; Path=/',
    // //    },
    // // ];

    return response
  },

  // invoked by CloudFront (viewer response)
  async cookieSetter(event, context) {
    console.log(JSON.stringify({ context, event }, null, 2))
    const response = event.Records[0].cf.response
    const headers = response.headers
    //
    const countryCode = (headers['x-country-code'] || [{}])[0].value || 'NA'
    headers['set-cookie'] = [
      {
        key: 'Set-Cookie',
        value: `ccc=${countryCode}; Path=/`
      }
    ]

    return response
  },

  async rewriteOrigin(event, context) {
    console.log(JSON.stringify({ context, event }, null, 2))
    const request = event.Records[0].cf.request
    if (request.uri.endsWith('//')) {
      const newUri = request.uri.slice(0, -1)
      const qs = request.querystring ? `?${request.querystring}` : ''
      request.headers = {
        location: [
          {
            key: 'Location',
            value: newUri + qs
          }
        ]
      }
      request.status = 301
      request.statusDescription = 'Found'
    }
    console.log(JSON.stringify({ request }, null, 2))
    return request
  }
}
