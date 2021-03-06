const Comments = require("../models/comments");
const commentReplies = require("../models/commentReplies")
const Storys = require("../models/Story");
const Users = require("../models/users")

const deletes = async (req, ress) => {
    const { idUser } = req;
    const { Idcomment, idStory } = req.body;

    let user = await Users.findById(idUser)
    if (user == null) {
        return ress.status(404).send({ ress: "user no existe" })
    }

    if (typeof idStory == "string" && idStory.length == 24) {
        let Story = await Storys.findById(idStory)
        if (Story == null) {
            return ress.status(404).json({
                ress: "story no existe"
            })
        }
        if (Story.user == idUser) {

            if (Story) {
                const userD = await user.storys.indexOf(idStory)

                await user.storys.splice(userD, 1)
                await user.save()


                let Cstories = await Story.comments
                if (Cstories) {
                    for (let i = 0; i < Cstories.length; i++) {
                        const C = Cstories[i];
                        let Dcomments = await Comments.findById(C).populate("commentReplies")
                        let CRstories = []
                        if (Dcomments.commentReplies) {
                            CRstories = await Dcomments.commentReplies
                            for (let i = 0; i < CRstories.length; i++) {
                                const e = CRstories[i];
                                await commentReplies.deleteOne({ _id: e })
                            }
                        }
                        await Comments.deleteOne({ _id: C })
                    }

                }

                await Story.deleteOne({ _id: idUser });

                return ress.status(202).send({ ress: "story delete" });
            } else {

                return ress.status(404).send({ ress: "historia no existe o no autorizado" });
            }
        } else {
            return ress.status(404).send({ ress: "no autorizado" });
        }
    } else if (typeof Idcomment == "string" && Idcomment.length == 24) {


        let comment = await Comments.findById(Idcomment)
            .populate("user", { _id: 1 })
            .populate({
                path: "commentReplies",
                select: {},
                match: {},
                options: {},
            })
        if (comment) {
            if (JSON.stringify(comment.user[0]._id) == JSON.stringify(user._id)) {

                if (comment.commentReplies) {

                    let CRstories = await comment.commentReplies
                    for (let i = 0; i < CRstories.length; i++) {
                        const e = CRstories[i]._id
                        await commentReplies.deleteOne({ _id: e })
                    }
                }
                let Dcomment = comment._id
                await Comments.deleteOne({ _id: Dcomment })
                return ress.status(202).send({ ress: "delete comment" })
            } else {
                return ress.status(202).send({ ress: "no autorizado" });
            }
        } else {
            return ress.status(404).send({ ress: "comentario no existe" });
        }
    } else {
        return ress.status(404).send({ ress: "missing data" });
    }

};
module.exports = deletes;
