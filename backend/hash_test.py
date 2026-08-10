from app.core.security import hash_password
p = "Aa!12345!"
print('len(str)=', len(p))
print('len(bytes)=', len(p.encode('utf-8')))
print('repr=', repr(p))
print('hashing...')
print(hash_password(p))
