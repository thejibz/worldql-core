const worldql = require("../src/worldql-core")

describe("Test the worldql", () => {
    jest.setTimeout(30000)

    test("stitch: mysql => elastic => openapi", () => {
        const gqlApis = [
            {
                source: {
                    type: "OPEN_API",
                    url: "http://localhost:8085/api-docs",
                    converter: "OASGRAPH"
                }
            },
            {
                source: {
                    url: 'http://localhost:9200',
                    type: 'ELASTICSEARCH',
                    params: {
                        graphqlTypeName: "companydatabase",
                        elasticIndex: 'companydatabase',
                        elasticType: 'employees',
                        pluralFields: ['skills', 'languages'],
                        apiVersion: '5.6',
                    },
                },
            },
            {
                source: {
                    type: "MYSQL",
                    host: "localhost",
                    port: "3306",
                    user: "root",
                    password: "secret",
                    database: "employees",
                    mysqlTableName: "employees",
                    graphqlTypeName: "employeesT",
                },
                links: [
                    {
                        inType: "employeesT",
                        on: {
                            field: {
                                name: "companydatabase",
                                type: "EsSearchOutput",
                                schemaUrl: "http://localhost:9200",
                                query: {
                                    name: "companydatabase",
                                    params: {
                                        static: {
                                            q: "Age:33"
                                        },
                                        parent: [
                                            // {
                                            //     q:"last_name",
                                            //     hits:"emp_no"
                                            // }
                                        ],
                                        variables: {}
                                    }
                                }
                            }
                        }
                    },
                    {
                        inType: "EsSearchOutput",
                        on: {
                            field: {
                                name: "petstore",
                                type: "viewerApiKey",
                                schemaUrl: "http://localhost:8085/api-docs",
                                query: {
                                    name: "viewerApiKey",
                                    params: {
                                        static: {
                                            apiKey: "qsdfqsdfsf"
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
        ]

        const gqlQuery = `
        {
            employees(emp_no: 10005) {
              first_name
              companydatabase {
                count
                petstore {
                  aPet(petId: 1) {
                    name
                  }
                }
              }
            }
          }`

        return worldql.buildGqlSchema(gqlApis).then(gqlSchema => {
            worldql.exec(gqlSchema, gqlQuery).then(response => {
                expect(response).toMatchObject({
                    data: {
                        employees: [
                            {
                                first_name: "Kyoichi",
                                companydatabase: {
                                    count: 2185,
                                    petstore: {
                                        aPet: {
                                            name: "doggie"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                })
            })
        })
    })
})
