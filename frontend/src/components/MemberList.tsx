import { Aside, MediaQuery, Navbar, NavLink } from "@mantine/core"

function MemberList() {
  return (
    <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
      <Aside p="sm" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
        {[...Array(4)].map((e, i) => (
          <NavLink label={`Person ${i+1}`}/>
        ))}
      </Aside>
    </MediaQuery>
  )
}

export default MemberList
