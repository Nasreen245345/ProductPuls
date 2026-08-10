from app.database.session import engine
from sqlalchemy import inspect

insp = inspect(engine)
print('tables:', insp.get_table_names())
