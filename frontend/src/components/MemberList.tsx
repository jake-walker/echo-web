import { Aside, MediaQuery, Navbar, NavLink } from "@mantine/core"
import { useSelector } from "react-redux"
import { RootState } from "../store"

function MemberList() {
  const users = useSelector((state: RootState) => state.chat.users);

  return (
    <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
      <Aside p="sm" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
        {users.map((user) => (
          <NavLink key={`user${user}`} label={user}/>
        ))}
      </Aside>
    </MediaQuery>
  )
}

export default MemberList
