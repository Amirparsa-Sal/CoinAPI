from setuptools import setup, find_packages

setup(
    name='coinnews webserver',
    version='1.0.0',
    packages=['coinnews_webserver'],
    install_requires=[
        # List your project dependencies here
        'flask==2.3.2',
        'Flask-SQLAlchemy==3.0.5',
        'python_dotenv==1.0.0',
        'psycopg2==2.9.6',
        'requests==2.31.0',
        'jsonschema==4.17.3',
        'flask-cors==4.0.0',
        # Add more dependencies as needed
    ],
    entry_points={
        'console_scripts': ['cn-webserver=coinnews_webserver.server:run']
    }
)