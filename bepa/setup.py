from setuptools import setup, find_packages

setup(
    name='bepa cronjob',
    version='1.0.0',
    packages=['bepa_cronjob'],
    install_requires=[
        # List your project dependencies here
        'sqlalchemy==2.0.17',
        'python_dotenv==1.0.0',
        'psycopg2==2.9.6',
        'requests==2.31.0',
        # Add more dependencies as needed
    ],
    entry_points={
        'console_scripts': ['bepa=bepa_cronjob.job:run']
    }
)