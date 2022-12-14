import { Tag } from 'antd'
import { FC } from 'react';
import { UserTag } from '../../../interfaces'

interface Props {
  userTags: UserTag[];
}

const UserTags: FC<Props> = ({userTags}) => {
  return (
    <div>
      <h4>Usuarios</h4>
      { 
        userTags.map(user => (<Tag style={{margin: 3}} color={user.color}>{user.name}</Tag>))
      }
    </div>
  )
}

export default UserTags