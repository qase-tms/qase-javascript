# Attachments in Newman

This guide covers attachment capabilities and limitations when using Newman with Qase reporter.

---

## Limitations

**Newman reporter does not support programmatic attachments.** Newman runs Postman collections which do not have a mechanism to attach files to individual test results.

Unlike other Qase reporters, there is no `qase.attach()` API available in Newman/Postman test scripts.

---

## What IS Reported

While attachments cannot be added programmatically, the Newman reporter automatically captures:

- **Request data** — HTTP method, URL, headers
- **Response data** — Status code, response body, headers
- **Test results** — Each `pm.test()` assertion result
- **Execution metadata** — Collection name, environment, iterations

These are included in the test result details sent to Qase.

---

## Alternatives

### 1. Use Postman Console Logging

Log important information to the Postman console, which can be viewed during test execution:

```javascript
pm.test('Response is successful', function() {
  console.log('Request URL:', pm.request.url.toString());
  console.log('Response Status:', pm.response.code);
  console.log('Response Body:', pm.response.text());

  pm.response.to.have.status(200);
});
```

### 2. Store Data in Collection Variables

Store test artifacts in collection or environment variables for later reference:

```javascript
pm.test('User creation successful', function() {
  const response = pm.response.json();

  // Store response for reference
  pm.collectionVariables.set('lastResponse', JSON.stringify(response, null, 2));
  pm.collectionVariables.set('createdUserId', response.id);

  pm.expect(response.id).to.exist;
});
```

### 3. Use Qase API Directly

For critical attachments, use the Qase API to upload files after test execution:

```bash
# After Newman run, upload attachment via Qase API
curl -X POST "https://api.qase.io/v1/result/{result_id}/attachment" \
  -H "Token: your_api_token" \
  -F "file=@screenshot.png"
```

### 4. Use Different Reporter

If attachments are essential, consider using a different testing framework that supports the Qase attachment API:
- **Playwright** — Full attachment support with `qase.attach()`
- **WebdriverIO** — Supports screenshots and file attachments
- **TestCafe** — Supports screenshots and file attachments

---

## Configuration

While attachments are not supported, you can configure what request/response data is included in test results:

```json
{
  "mode": "testops",
  "testops": {
    "project": "YOUR_PROJECT_CODE",
    "api": {
      "token": "YOUR_API_TOKEN"
    }
  },
  "debug": true
}
```

Enable debug logging to see what data is being captured and reported.

---

## What About Screenshots?

Newman runs headless API tests and does not interact with browsers, so screenshots are not applicable.

If you need browser interaction with screenshots:
- Use Playwright, Puppeteer, or Selenium for browser automation
- Integrate with Qase using the corresponding reporter (playwright-qase-reporter, etc.)

---

## Troubleshooting

### Why No Attachment Support?

Newman is a command-line runner for Postman collections. Postman's test scripting API (`pm.*`) does not provide file system access or attachment capabilities for security and portability reasons.

### Can I Add Attachments in Postman Desktop?

Postman Desktop application is separate from Newman. Attachments added in Postman Desktop are not transferred to Newman test runs.

### Can I Base64 Encode and Store?

You can store base64-encoded data in variables, but this does not create visual attachments in Qase. The data would only be available as text in console output or variables.

---

## See Also

- [Usage Guide](usage.md)
- [Steps Guide](STEPS.md)
- [Configuration Reference](../../qase-javascript-commons/README.md)
