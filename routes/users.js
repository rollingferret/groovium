const express = require('express');
const router = express.Router();
const { asyncHandler } = require("../utils");
const { User, Topic, Story} = require('../db/models');


router.get('/delete', asyncHandler(async (req, res) => {
    res.render('/delete')
}))


router.get('/:userId', asyncHandler(async (req, res) => {

    const currentUserId = req.session.auth.userId;
    const userId = Number(req.url.split('/')[1])

    const user = await User.findByPk(userId, {
        include: [{
            model: User,
            as: 'followings',
        }, {
            model: Topic,
            as: 'likedTopics'
        }]
    });

    const followingsIds = user.followings.map(user => user.id)
    const feedStories = await Story.findAll({
        limit: 5,
        include: [User, Topic],
        where: {
            userId: followingsIds,
        }
    })

    const newStories = feedStories.map(story => {
        const date = story.createdAt
        const month = date.getMonth() + 1
        const day = date.getDate()
        const newDate = `${month}-${day}`

        return {
          id: story.id,
          title: story.title,
          userId: story.User.id,
          avatarUrl: story.User.avatarUrl,
          firstName: story.User.firstName,
          lastName: story.User.lastName,
          summary: story.summary,
          date: newDate,
          readTimeMinutes: story.readTimeMinutes,
          topicId: story.topicId,
          topic: story.Topic.topic,
          storyImgUrl: story.storyImgUrl
        }
      })

    const myStories = await Story.findAll({
        limit: 5,
        where: {
            userId
        }
    })
    console.log(userId, "<----- userId");
    console.log(currentUserId, "currentUserId")
    if(userId === currentUserId){
        res.render('home', {user, myStories, newStories})
    } else {
        res.render('other-profiles-page', { user, newStories })
    }
}));

router.get('/:userId/my-stories', asyncHandler(async (req, res) => {
    const userId = req.session.auth.userId
    const user = await User.findByPk(userId, {
        include: [{
            model: Story,
            limit: 5,
            include: [User, Topic]
        },
        {
            model: Story,
            as: 'bookmark'
        }
    ]
    })

    const newStories = user.Stories.map(story => {
        const date = story.createdAt
        const month = date.getMonth() + 1
        const day = date.getDate()
        const newDate = `${month}-${day}`

        return {
            id: story.id,
            title: story.title,
            userId: story.User.id,
            avatarUrl: story.User.avatarUrl,
            firstName: story.User.firstName,
            lastName: story.User.lastName,
            summary: story.summary,
            date: newDate,
            readTimeMinutes: story.readTimeMinutes,
            topicId: story.topicId,
            topic: story.Topic.topic,
            storyImgUrl: story.storyImgUrl
        }
    })
    res.render('my-stories', {user, newStories})
}))

// router.get('/:userId', asyncHandler(async (req, res) => {
//     //const userId = req.params.userId

//     const user = await User.findByPk(userId, {
//         limit: 5,
//         include: [{
//             model: User,
//             as: 'followings',
//         }, {
//             model: Topic,
//             as: 'likedTopics',
//         }, {
//             model: Story,
//             include: [User, Topic]
//         }
//     ]
//     });

//     const newStories = user.Stories.map(story => {
//         const date = story.createdAt
//         const month = date.getMonth() + 1
//         const day = date.getDate()
//         const newDate = `${month}-${day}`

//         return {
//             id: story.id,
//             title: story.title,
//             userId: user.id,
//             avatarUrl: user.avatarUrl,
//             firstName: user.firstName,
//             lastName: user.lastName,
//             summary: story.summary,
//             date: newDate,
//             readTimeMinutes: story.readTimeMinutes,
//             topicId: story.topicId,
//             topic: story.Topic.topic,
//             storyImgUrl: story.storyImgUrl
//         }
//     })

//     res.render('other-profiles-page', { user, newStories })
// }));



module.exports = router;
