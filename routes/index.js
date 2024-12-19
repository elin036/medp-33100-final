var express = require('express');
const connectToDatabase = require('../config/db');
var router = express.Router();
const { ObjectId } = require('mongodb');

/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const db = await connectToDatabase();
    const PostsWithTags = await db.collection('posts').aggregate([
      {
        $lookup: {
          from: 'tags',
          let: { postsid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ['$$postsid', '$postsid']
                }
              }
            }
          ],
          as: 'postTags'
        }
      }
    ]).toArray();

    const uniqueTags = new Set(["All"]);
    PostsWithTags.forEach(post => {
      if (post.postTags && post.postTags.length > 0) {
        post.postTags.forEach(tag => {
          if (tag.tagName && tag.tagName.trim() !== '') {
            uniqueTags.add(tag.tagName);
          }
        });
      }
    });
    
    // Render the posts and tags
    res.render('index', { posts: PostsWithTags, tags: Array.from(uniqueTags) });
  } catch (error) {
    console.error("Error fetching posts and their tags:", error);
    res.render('index', { posts: [], tags: [] });
  }
});

//POST
router.post('/', async function (req, res, next) {
  const { title, from, to, description, tags } = req.body;
  const newPost = {
    title,
    from,
    to,
    description
  };
  try {
    const db = await connectToDatabase();
    const result = await db.collection('posts').insertOne(newPost);
    const postId = result.insertedId;

    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0); 

    if (tagArray.length > 0) {
      for (const tag of tagArray) {
        await db.collection('tags').updateOne(
          { tagName: tag },
          {
            $setOnInsert: { tagName: tag }, 
            $addToSet: { postsid: postId } 
          },
          { upsert: true } 
        );
      }
    }
    res.redirect('/');
  } catch (error) {
    console.error('Error adding post and tags:', error);
    res.status(500).send({ error: 'An error occurred while adding the post and tags.' });
  }
});

//PUT
router.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { title: new_title, from: new_from, to: new_to, description: new_description, tags: new_tags } = req.body;
  try {
    const db = await connectToDatabase();

    const postUpdateResult = await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { title: new_title, from: new_from, to: new_to, description: new_description } }
    );

    if (!postUpdateResult.matchedCount) {
      return res.status(404).send('Post not found');
    }

    const normalizedTags = new_tags.map(
      tag => tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()
    );

    await db.collection('tags').updateMany(
      { postsid: new ObjectId(postId) },
      { $pull: { postsid: new ObjectId(postId) } }
    );

    if (normalizedTags.length > 0) {
      for (const tag of normalizedTags) {
        await db.collection('tags').updateOne(
          { tagName: tag },
          {
            $setOnInsert: { tagName: tag },
            $addToSet: { postsid: new ObjectId(postId) }
          },
          { upsert: true }
        );
      }
    }

    const tagsWithNoPosts = await db.collection('tags').find({ postsid: { $size: 0 } }).toArray();
    for (const tag of tagsWithNoPosts) {
      await db.collection('tags').deleteOne({ _id: tag._id });
    }

    res.send('Post updated successfully');
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).send('Error updating post in the database');
  }
});


//DELETE
router.delete('/delete/:id', async function (req, res, next) {
  const { id } = req.params;
  try {
    const db = await connectToDatabase();

    // Delete the post
    const result = await db.collection('posts').deleteOne({ _id: new ObjectId(id) });

    await db.collection('tags').updateMany(
      { postsid: new ObjectId(id) },
      { $pull: { postsid: new ObjectId(id) } }
    );

    const tagsWithNoPosts = await db.collection('tags').find({ postsid: { $size: 0 } }).toArray();
    for (const tag of tagsWithNoPosts) {
      await db.collection('tags').deleteOne({ _id: tag._id });
    }

    res.status(200).send({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Error deleting post and tags:', error);
    res.status(500).send({ error: 'An error occurred while deleting the post and tags.' });
  }
});

module.exports = router;