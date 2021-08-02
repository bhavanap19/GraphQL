const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
    input PostInput {
        title : String
        content : String
    }

    type Post{
        id:ID!
        title:String
        content:String
    }

    type Query{
        getPost(id: ID!): Post
        getPosts: [Post]
    }

    type Mutation {
        createPost(input: PostInput): Post
        updatePost(id: ID!, input: PostInput): Post
    }
`);

class Post{
    constructor(id, {title,content}) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}

let database = {};

const root = {
    getPost: ({id}) => {
        if(!database[id]){
            throw new Error(`No post with id ${id}`);
        }
        return new Post(id, database[id]);
        
    },
    getPosts: () => {
        let posts = [];
        for (let id in database){
            if(database.hasOwnProperty(id)){
                let post = database[id];
                posts.push(new Post(id, post));
            }
        }

        return posts;
    },

    createPost: ({input}) =>{
        let id = require('crypto').randomBytes(10).toString('hex');

        database[id] = input;
        return new Post(id,input);
    },
    updatePost: ({id, input}) => {
        if(!database[id]) {
            throw new Error (`No post with is ${id}`);
        }
        database[id]= input;
        return new Post(id,input);

    }
}

const app = express();
app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
}));

app.listen(4000, () =>{
    console.log(`Running graphql at http://localhost:4000/graphiql`);
})