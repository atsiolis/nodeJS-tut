const usersDB = {
    users: require('../model/users.json'),
    setUsers: function (data) { this.users = data }
}
const fsPromises = require('fs').promises
const path = require('path')

const handleLogout = async (req, res) => {
    // on client also delete the access token

    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) // No Content
    const refreshToken = cookies.jwt

    // is refresh token in database?
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
        return res.sendStatus(403)
    }

    //delete refresh token in database
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken)
    const currentUser = { ...foundUser, refreshToken: '' }
    usersDB.setUsers([...otherUsers, currentUser])
    await fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(usersDB.users)
    )

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.sendStatus(204) // No Content
}

module.exports = {
    handleLogout
}