const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder Advanced Qase Features', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(11, 'Complex nested steps - multi-resource retrieval'), async function() {
    qase.fields({ layer: 'api', severity: 'normal', priority: 'medium' });

    let user;
    let userPosts;
    let firstPostComments;

    await qase.step('Retrieve user and their content', async () => {
      await qase.step('Fetch user data', async () => {
        const response = await fetch(`${BASE_URL}/users/1`);
        assert.strictEqual(response.status, 200);
        user = await response.json();
        assert.strictEqual(user.name, 'Leanne Graham');
      });

      await qase.step('Fetch user posts', async () => {
        const response = await fetch(`${BASE_URL}/posts?userId=${user.id}`);
        assert.strictEqual(response.status, 200);
        userPosts = await response.json();
        assert.ok(userPosts.length > 0, 'User should have posts');
      });

      await qase.step('Fetch comments for first post', async () => {
        const firstPost = userPosts[0];
        const response = await fetch(`${BASE_URL}/posts/${firstPost.id}/comments`);
        assert.strictEqual(response.status, 200);
        firstPostComments = await response.json();
        assert.ok(firstPostComments.length > 0, 'Post should have comments');
      });
    });

    await qase.step('Verify data relationships', async () => {
      await qase.step('Verify all posts belong to user', async () => {
        userPosts.forEach(post => {
          assert.strictEqual(post.userId, user.id, 'All posts should belong to the user');
        });
      });

      await qase.step('Verify all comments belong to the post', async () => {
        const firstPostId = userPosts[0].id;
        firstPostComments.forEach(comment => {
          assert.strictEqual(comment.postId, firstPostId, 'All comments should belong to the post');
        });
      });
    });

    qase.comment(`Retrieved data for user "${user.name}" with ${userPosts.length} posts and ${firstPostComments.length} comments on first post`);
  });

  it(qase(12, 'Suite hierarchy demonstration'), async function() {
    qase.suite('API Tests\tAdvanced\tRelationships');
    qase.fields({ layer: 'api', severity: 'low' });

    let albums;
    let photos;

    await qase.step('Test album and photo relationships', async () => {
      const albumResponse = await fetch(`${BASE_URL}/albums/1`);
      const album = await albumResponse.json();
      assert.strictEqual(album.id, 1);

      const photosResponse = await fetch(`${BASE_URL}/albums/1/photos`);
      photos = await photosResponse.json();
      assert.ok(photos.length > 0, 'Album should have photos');

      albums = [album];
    });

    await qase.step('Verify photo structure', async () => {
      const firstPhoto = photos[0];
      assert.ok(firstPhoto.id, 'Photo should have id');
      assert.ok(firstPhoto.albumId, 'Photo should have albumId');
      assert.ok(firstPhoto.title, 'Photo should have title');
      assert.ok(firstPhoto.url, 'Photo should have url');
      assert.ok(firstPhoto.thumbnailUrl, 'Photo should have thumbnailUrl');
    });

    qase.attach({
      name: 'album-photos-sample.json',
      content: JSON.stringify({
        album: albums[0],
        photoCount: photos.length,
        samplePhotos: photos.slice(0, 3)
      }, null, 2),
      contentType: 'application/json'
    });
  });

  it(qase(13, 'Parameterized test pattern - multiple user IDs'), async function() {
    const userIds = [1, 2, 3];
    qase.parameters({ userIds: userIds.join(', ') });

    let allUsers = [];

    await qase.step('Fetch multiple users by ID', async () => {
      for (const userId of userIds) {
        await qase.step(`Fetch user ${userId}`, async () => {
          const response = await fetch(`${BASE_URL}/users/${userId}`);
          assert.strictEqual(response.status, 200);
          const user = await response.json();
          assert.strictEqual(user.id, userId);
          allUsers.push(user);
        });
      }
    });

    await qase.step('Verify all users were retrieved', async () => {
      assert.strictEqual(allUsers.length, userIds.length, 'Should have retrieved all requested users');
      allUsers.forEach((user, index) => {
        assert.strictEqual(user.id, userIds[index], `User ${index} should have correct ID`);
      });
    });

    qase.attach({
      name: 'multiple-users.json',
      content: JSON.stringify(allUsers, null, 2),
      contentType: 'application/json'
    });
  });

  it.skip(qase(14, 'Future feature - API authentication'), function() {
    qase.ignore();
    qase.comment('This test is ignored as JSONPlaceholder does not support authentication. Future implementation for authenticated APIs.');

    // Placeholder for future authentication testing
    // When testing real APIs with authentication:
    // - Test token/API key validation
    // - Test expired token handling
    // - Test unauthorized access attempts
    // - Test role-based access control
  });
});
