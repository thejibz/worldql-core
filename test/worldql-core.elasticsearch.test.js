process.env.DEBUG = ["worldql-core"]
process.env.DEBUG_DEPTH = 15

const globalTunnel = require("global-tunnel")
globalTunnel.initialize() // use ENV http_proxy for all requests

const worldql = require("../src/worldql-core")

describe("Test the worldql for elasticsearch", () => {
    jest.setTimeout(15000)

    test("get all employees of age 33", () => {
        const gqlApis = [
            {
                source: {
                    url: "http://localhost:9200",
                    type: "ELASTICSEARCH",
                    params: {
                        graphqlTypeName:  "employees",
                        elasticIndex: "companydatabase",
                        elasticType: "employees",
                        apiVersion: "5.6"
                    }
                }
            }
        ]

        const gqlQuery = `
        {
            employees(q:"Age:33"){
              count
              hits {
                _source {
                  Age
                  Designation
                  Address
                }
              }
            }
          }`

        return worldql.buildGqlSchema(gqlApis).then(gqlSchema => {
            worldql.exec(gqlSchema, gqlQuery).then(response => {
                expect(response).toMatchObject({
                    data: {
                        employees: {
                            count: expect.any(Number),
                            hits: expect.any(Array)
                        }
                    }
                })
            })
        })
    })
})
