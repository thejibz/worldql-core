const GraphQL = require("graphql")
const worldql = require("../src/worldql-core")

describe("Test the worldql for graphql", () => {
    jest.setTimeout(30000)

    test("get all books", () => {
        const wqlConf = {
            datasources: {
                books: {
                    url: "http://localhost:8090",
                    type: "GRAPHQL",
                },
            },
        }

        const gqlQuery = `
        {
            books {
              title
              author
            }
        }`

        return worldql.buildGqlSchema(wqlConf).then(gqlSchema => {
            return GraphQL.graphql({
                schema: gqlSchema,
                source: gqlQuery,
                // variableValues: gqlVariables
                contextValue: {}
            }).then(gqlResponse => {
                expect(gqlResponse).toMatchObject({
                    data: {
                        books: [
                            {
                                title: "Harry Potter and the Chamber of Secrets",
                                author: "J.K. Rowling"
                            },
                            {
                                title: "Jurassic Park",
                                author: "Michael Crichton"
                            }
                        ]
                    }
                })
            })
        })
    })
})
