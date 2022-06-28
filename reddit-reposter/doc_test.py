from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from marshmallow import Schema, fields
from flask import Flask, abort, request, make_response, jsonify
from pprint import pprint
import json


class DemoParameter(Schema):
    gist_id = fields.Int()


class DemoSchema(Schema):
    id = fields.Int()
    content = fields.Str()


spec = APISpec(
    title="Demo API",
    version="1.0.0",
    openapi_version="3.0.2",
    info=dict(
        description="Demo API",
        version="1.0.0-oas3",
        contact=dict(
            email="admin@donofden.com"
            ), 
        license=dict(
            name="Apache 2.0",
            url='http://www.apache.org/licenses/LICENSE-2.0.html'
            )
        ),
    servers=[
        dict(
            description="Test server",
            url="https://resources.donofden.com"
            )
        ],
    tags=[
        dict(
            name="Demo",
            description="Endpoints related to Demo"
            )
        ],
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

spec.components.schema("Demo", schema=DemoSchema)

# Extensions initialization
# =========================
app = Flask(__name__)


@app.route("/demo/<gist_id>", methods=["GET"])
def my_route(gist_id):
    """Gist detail view.
    ---
    get:
      parameters:
      - in: path
        schema: DemoParameter
      responses:
        200:
          content:
            application/json:
              schema: DemoSchema
        201:
          content:
            application/json:
              schema: DemoSchema
    """
    # (...)
    return jsonify('foo')


# Since path inspects the view and its route,
# we need to be in a Flask request context
with app.test_request_context():
    spec.path(view=my_route)
# We're good to go! Save this to a file for now.
with open('swagger.json', 'w') as f:
    json.dump(spec.to_dict(), f)

pprint(spec.to_dict())
print(spec.to_yaml())