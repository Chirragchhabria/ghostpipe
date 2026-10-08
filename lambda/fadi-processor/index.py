"""Lambda FADI + reconciler. Deploy: sam build && sam deploy."""
def handler(event, context):
    return {"statusCode": 200, "body": '{"ok": true, "note": "FADI on s3://sentinel-cogs; see src/lib/spectral.ts for mirror"}'}
