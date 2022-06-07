import CreateBlogPost from './blogchain/CreateBlogPost'
import ListBlogPosts from './blogchain/ListBlogPosts'
import { Grid, Container } from 'semantic-ui-react'

function Blogchain() {
  return (
    <Grid.Column width={16}>
      <Container>
        <Grid stackable columns="equal">
          <ListBlogPosts />
          <CreateBlogPost />
        </Grid>
      </Container>
    </Grid.Column>
  )
}

export default Blogchain
