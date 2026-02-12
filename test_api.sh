#!/bin/bash
# Test admin login
curl -s -X POST https://neuroplay.vp1.officex.site/api/admin/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@neuroplay.com","password":"admin123"}'
echo ""

# Test provider search
curl -s -X GET 'https://neuroplay.vp1.officex.site/api/provider/search?code=0001'
echo ""

# Test avatars
curl -s https://neuroplay.vp1.officex.site/api/user/avatars | head -c 200
echo ""
