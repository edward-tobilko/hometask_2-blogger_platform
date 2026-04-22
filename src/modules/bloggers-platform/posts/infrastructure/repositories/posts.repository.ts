import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  Post,
  PostDocument,
  PostModel,
} from '../../domain/entities/post.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: PostModel) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.postModel.findById(id).exec();
  }

  async save(postDoc: PostDocument): Promise<void> {
    await postDoc.save();
  }

  async delete(id: string): Promise<void> {
    await this.postModel.findByIdAndDelete(id).exec();
  }
}
