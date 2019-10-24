const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user');
const auth = require('../middleware/auth');
const Task = require('../models/task');

const { sendWelcomeEmail, sendCancelationEmail} = require('../emails/account');
const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name, user._id);
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();

        res.send()
    } catch (e) {
        res.status(500).send()
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send()
    } catch (e) {
        res.status(500).send()
    }
});

router.get('/users/:userId/profile', async (req, res) => {
    const userId = req.params.userId;

    const userModel = await User.findOne({_id : userId});
    if (!userModel) {
        throw new Error('Invalid userid')
    }

    const getTask = await Task.find({owner : userId});
    if (!getTask) {
        throw new Error('There is no current tasks')
    }
    const doTask = await Task.find({owner : userId, completed : false});
    if (!getTask) {
        throw new Error('There is no active tasks')
    }

    const finTask = await Task.find({owner : userId, completed : true});
    if (!getTask) {
        throw new Error('No tasks have been finished')
    }
    const userName = userModel.name;

    let dTask = doTask.map(function (dTask) {
        return dTask.description;
    });

    let fTask = finTask.map(function (fTask) {
        return fTask.description;
    });


    //find the users tasks using the tasks model

    res.render('profile', {
        title: 'User Profile',
        name: userName,
        linkUrl: `/users/${userId}/avatar`,
        helpText: 'This is some helpful text.',
        each_dotask: dTask,
        each_fintask: fTask,
    })

});

router.get('/profileSearch', async (req, res) => {


    res.render('profileSearch', {
        title: 'Profile Search',
        linkUrl: `/profileSeach`,

    
    })

})
    



router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancelationEmail(req.user.email, req.user.name);
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send()
});

router.get('/users/:id/avatar', async (req, res) => {
   try {
       const user = await User.findById(req.params.id);

       if (!user || !user.avatar) {
           throw new Error()
       }

       res.set('Content-Type', 'image/png');
       res.send(user.avatar)
   } catch (e) {
       res.status(404).send()
   }
});

module.exports = router;