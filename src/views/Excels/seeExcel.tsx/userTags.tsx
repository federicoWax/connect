import { Badge, Tag } from 'antd'
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
      <div style={{display: "flex"}}>
      {
        [...activeUsers]
        .sort((a, b) => Number(b.active) - Number(a.active))
        .map(user => (
          <div 
            key={user.userId}
            style={{marginRight: 5}}
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
      </div>
    </div>
  )
}

export default UserTags