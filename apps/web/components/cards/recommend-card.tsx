import Image from 'next/image';
import Link from 'next/link';

const RecommendCard = (props:{ 
    id: string;
    imageUrl: string;
    introduces: string;
 }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-64 h-64">
        <Image
          src={props.imageUrl}
          alt="abc"
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">{props.id}</h3>
        <p className="text-sm text-gray-600">{props.introduces}</p>
      </div>
    </div>
  );
}

export default RecommendCard;