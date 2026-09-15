import db from "../models/index.js"

export const findOrCreateUser = async(from) => {
  const [created, user] = await db.user.findOrCreate({
    where: {id: from.id},
    defaults: {
      id: from.id,
      firstName: from.first_name,
    }
  })

  return {created, user}
}

export const getUserSessions = async(from) => {
  try {
    const sessions = await db.session.findAll({where: {user_id: from.id}})
    return sessions
  } catch (e) {console.log(e)}
}