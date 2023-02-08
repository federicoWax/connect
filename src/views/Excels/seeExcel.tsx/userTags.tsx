import { Badge, Row, Tag } from 'antd'
import { FC } from 'react';
import { ActiveUser } from '../../../interfaces'
interface Props {
  activeUsers: ActiveUser[];
}

const UserTags: FC<Props> = ({ activeUsers }) => {
  if(!activeUsers?.length) return null;

  return (
    <div>
      <h4>Usuarios</h4>
      <Row style={{display: "flex"}}>
      {
        [...activeUsers]
        .sort((a, b) => Number(b.active) - Number(a.active))
        .map(user => (
          <div 
            key={user.userId}
            style={{margin: 2}}
          >
            <Badge
              dot
              color={activeUsers.some(au => au.userId === user.userId && au.active) ? "green" : "red"}
            >
              <Tag
                style={{ margin: 3 }}
                color={user.color}
              >
                <b>{user.user?.name.toUpperCase()}</b>
              </Tag>
            </Badge>
          </div>
        ))
      }
      </Row>
    </div>
  )
}

export default UserTags