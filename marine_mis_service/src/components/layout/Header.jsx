import useUserStore from '../../store/useUserStore';

const Header = () => {
  const { user } = useUserStore();

  return (
    <header className="bg-blue-800 text-white h-16 flex items-center justify-between px-6 shadow-md z-10">
      <div className="text-xl font-bold">Marine GIS Service</div>
      <div className="text-sm">
        {user ? (
          <span>환영합니다. <span className="font-semibold">{user.name}</span>님</span>
        ) : (
          <span>사용자 정보를 불러오는 중...</span>
        )}
      </div>
    </header>
  );
};

export default Header;
