const { qase } = require('mocha-qase-reporter/mocha');
const assert = require('assert');

describe('JSONPlaceholder Advanced Qase Features', function() {
  const BASE_URL = 'https://jsonplaceholder.typicode.com';

  it(qase(11, 'Multiple steps - multi-resource retrieval'), async function() {
    this.fields({ layer: 'api', severity: 'normal', priority: 'medium' });

    const userResponse = await fetch(`${BASE_URL}/users/1`);
    const user = await userResponse.json();

    this.step('Verify user data', () => {
      assert.strictEqual(userResponse.status, 200);
      assert.strictEqual(user.name, 'Leanne Graham');
    });

    const postsResponse = await fetch(`${BASE_URL}/posts?userId=${user.id}`);
    const userPosts = await postsResponse.json();

    this.step('Verify user posts', () => {
      assert.strictEqual(postsResponse.status, 200);
      assert.ok(userPosts.length > 0, 'User should have posts');
    });

    const firstPostId = userPosts[0].id;
    const commentsResponse = await fetch(`${BASE_URL}/posts/${firstPostId}/comments`);
    const firstPostComments = await commentsResponse.json();

    this.step('Verify comments for first post', () => {
      assert.strictEqual(commentsResponse.status, 200);
      assert.ok(firstPostComments.length > 0, 'Post should have comments');
    });

    this.step('Verify all posts belong to user', () => {
      userPosts.forEach(post => {
        assert.strictEqual(post.userId, user.id, 'All posts should belong to the user');
      });
    });

    this.step('Verify all comments belong to the post', () => {
      firstPostComments.forEach(comment => {
        assert.strictEqual(comment.postId, firstPostId, 'All comments should belong to the post');
      });
    });

    this.comment(`Retrieved data for user "${user.name}" with ${userPosts.length} posts and ${firstPostComments.length} comments on first post`);
  });

  it(qase(12, 'Suite hierarchy demonstration'), async function() {
    this.suite('API Tests\tAdvanced\tRelationships');
    this.fields({ layer: 'api', severity: 'low' });

    const albumResponse = await fetch(`${BASE_URL}/albums/1`);
    const album = await albumResponse.json();
    const photosResponse = await fetch(`${BASE_URL}/albums/1/photos`);
    const photos = await photosResponse.json();

    this.step('Test album and photo relationships', () => {
      assert.strictEqual(album.id, 1);
      assert.ok(photos.length > 0, 'Album should have photos');
    });

    this.step('Verify photo structure', () => {
      const firstPhoto = photos[0];
      assert.ok(firstPhoto.id, 'Photo should have id');
      assert.ok(firstPhoto.albumId, 'Photo should have albumId');
      assert.ok(firstPhoto.title, 'Photo should have title');
      assert.ok(firstPhoto.url, 'Photo should have url');
      assert.ok(firstPhoto.thumbnailUrl, 'Photo should have thumbnailUrl');
    });

    this.attach({
      name: 'album-photos-sample.json',
      content: JSON.stringify({
        album,
        photoCount: photos.length,
        samplePhotos: photos.slice(0, 3)
      }, null, 2),
      contentType: 'application/json'
    });
  });

  it(qase(13, 'Parameterized test pattern - multiple user IDs'), async function() {
    const userIds = [1, 2, 3];
    this.parameters({ userIds: userIds.join(', ') });

    const allUsers = [];

    for (const userId of userIds) {
      const response = await fetch(`${BASE_URL}/users/${userId}`);
      const user = await response.json();

      this.step(`Verify user ${userId}`, () => {
        assert.strictEqual(response.status, 200);
        assert.strictEqual(user.id, userId);
      });

      allUsers.push(user);
    }

    this.step('Verify all users were retrieved', () => {
      assert.strictEqual(allUsers.length, userIds.length, 'Should have retrieved all requested users');
      allUsers.forEach((user, index) => {
        assert.strictEqual(user.id, userIds[index], `User ${index} should have correct ID`);
      });
    });

    this.attach({
      name: 'multiple-users.json',
      content: JSON.stringify(allUsers, null, 2),
      contentType: 'application/json'
    });
  });

  it.skip(qase(14, 'Future feature - API authentication'), function() {
    this.ignore();
    this.comment('This test is ignored as JSONPlaceholder does not support authentication. Future implementation for authenticated APIs.');

    // Placeholder for future authentication testing
    // When testing real APIs with authentication:
    // - Test token/API key validation
    // - Test expired token handling
    // - Test unauthorized access attempts
    // - Test role-based access control
  });
});
