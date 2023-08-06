const express = require('express');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const router = express.Router();
const { check, validationResult } = require('express-validator');
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile' });
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/',
    [
        auth,
        [
            check('status', 'Status Field is required.').not().isEmpty(),
            check('skills', 'Skill Field is required.').not().isEmpty()
        ],
        async (req, res) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const {
                company,
                website,
                location,
                bio,
                status,
                githubusername,
                skills,
                youtube,
                facebook,
                twitter,
                instagram,
                linkedin
            } = req.body;

            //build profile object
            const profileFields = {};
            profileFields.user = req.user.id;
            if (company) profileFields.company = company;
            if (website) profileFields.website = website;
            if (location) profileFields.location = location;
            if (bio) profileFields.bio = bio;
            if (status) profileFields.status = status;
            if (githubusername) profileFields.githubusername = githubusername;
            if (skills) {
                profileFields.skills = skills.split(',').map(skill => skill.trim());
            }

            //build social object
            profileFields.social = {};
            if (youtube) profileFields.social.youtube = youtube;
            if (twitter) profileFields.social.twitter = twitter;
            if (facebook) profileFields.social.facebook = facebook;
            if (linkedin) profileFields.social.linkedin = linkedin;
            if (instagram) profileFields.social.instagram = instagram;

            try {
                let profile = await Profile.findOne({ user: req.user.id });
                if (profile) {
                    profile = await Profile.findOneAndUpdate(
                        { user: req.user.id },
                        { $set: profileFields },
                        { new: true }
                    );
                    return res.json(profile);
                }

                //create profile 
                profile = new Profile(profileFields);
                await profile.save();
                res.json(profile);
            } catch (err) {
                console.error(err.message);
                res.status(500).send('server error');
            }
        }
    ]);

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);

    } catch (err) {
        console.error(err.message);
        res.status(500).json('server error')
    }
});

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'profile does not exists' });
        }
        res.json(profile)

    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'profile does not exists' });
        }
        res.status(500).json('server error')
    }
});

router.delete('/', auth, async (req, res) => {

    try {
        // todo - remove all posts
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'user deleted successfully.' })
    } catch (err) {
        console.log(err.message);
        res.status(500).json('server error')
    }
});

router.put('/experience', [auth, [
    check('title', 'Title field is required.').not().isEmpty(),
    check('company', 'Company field is required.').not().isEmpty(),
    check('from', 'From field is required.').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(errors);
        res.status(500).send('server error');
    }
});

router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        // get remove index
        const removeIndex = profile.experience.map(index => index.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);
        await profile.save()
        res.json(profile);
    } catch (err) {
        console.log(err);
        res.status(500).send('server error');
    }
});

router.put('/education', [
    auth,
    check('school', 'School Field is required.').not().isEmpty(),
    check('degree', 'Degree Field is required.').not().isEmpty(),
    check('fieldofstudy', 'Study Field is required.').not().isEmpty(),
    check('from', 'From Field is required.').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile)
    } catch (err) {
        console.log(err);
        res.status(500).send('server error')
    }
});

router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.log(err);
        res.status(500).send('server error');
    }
});

module.exports = router;